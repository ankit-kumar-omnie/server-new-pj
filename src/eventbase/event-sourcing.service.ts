import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventData, EventRecord } from './event-schema';
import { EventSourcingResult, EventTimeline, EventStatistics, StreamBatch } from './interfaces/event-sourcing.interfaces';

@Injectable()
export class EventSourcingService {
  constructor(
    @InjectModel(EventData.name) private eventModel: Model<EventData>,
  ) {}

  async replayEvents<T = any>(entityId: string, options?: {
    fromDate?: Date;
    toDate?: Date;
    eventTypes?: string[];
    batchSize?: number;
  }): Promise<EventSourcingResult<T>> {
    const eventData = await this.eventModel.findOne({ id: entityId }).lean();

    if (!eventData?.events?.length) {
      return {
        entityId,
        currentState: null,
        eventHistory: [],
        totalEvents: 0,
      };
    }

    let filteredEvents = eventData.events;

    // Apply filters
    if (options?.fromDate || options?.toDate || options?.eventTypes) {
      filteredEvents = eventData.events.filter(event => {
        if (options.fromDate && new Date(event.createdAt) < options.fromDate) return false;
        if (options.toDate && new Date(event.createdAt) > options.toDate) return false;
        if (options.eventTypes && !options.eventTypes.includes(event.eventName)) return false;
        return true;
      });
    }

    // Replay events to build current state
    const currentState = this.replayEventsToState<T>(filteredEvents, entityId);

    return {
      entityId,
      currentState,
      eventHistory: filteredEvents.map(event => ({
        eventName: event.eventName,
        payload: event.payload,
        createdAt: event.createdAt,
      })),
      totalEvents: filteredEvents.length,
      lastEventAt: filteredEvents.length > 0 ? filteredEvents[filteredEvents.length - 1].createdAt.toISOString() : undefined,
    };
  }

  async getStateAtTime<T = any>(entityId: string, timestamp: Date): Promise<EventSourcingResult<T>> {
    const eventData = await this.eventModel.findOne({ id: entityId }).lean();

    if (!eventData?.events?.length) {
      throw new NotFoundException(`Events not found for entity ${entityId}`);
    }

    // Filter events up to the specified timestamp
    const eventsUpToTime = eventData.events.filter(
      event => new Date(event.createdAt) <= timestamp
    );

    if (eventsUpToTime.length === 0) {
      return {
        entityId,
        currentState: null,
        eventHistory: [],
        totalEvents: 0,
      };
    }

    const stateAtTime = this.replayEventsToState<T>(eventsUpToTime, entityId);

    return {
      entityId,
      currentState: stateAtTime,
      eventHistory: eventsUpToTime.map(event => ({
        eventName: event.eventName,
        payload: event.payload,
        createdAt: event.createdAt,
      })),
      totalEvents: eventsUpToTime.length,
      lastEventAt: eventsUpToTime[eventsUpToTime.length - 1].createdAt.toISOString(),
    };
  }

  async getStateAfterEvents<T = any>(entityId: string, eventCount: number): Promise<EventSourcingResult<T>> {
    const eventData = await this.eventModel.findOne({ id: entityId }).lean();

    if (!eventData?.events?.length) {
      throw new NotFoundException(`Events not found for entity ${entityId}`);
    }

    // Take only the first N events
    const eventsToReplay = eventData.events.slice(0, eventCount);
    const stateAfterEvents = this.replayEventsToState<T>(eventsToReplay, entityId);

    return {
      entityId,
      currentState: stateAfterEvents,
      eventHistory: eventsToReplay.map(event => ({
        eventName: event.eventName,
        payload: event.payload,
        createdAt: event.createdAt,
      })),
      totalEvents: eventsToReplay.length,
      lastEventAt: eventsToReplay.length > 0 ? eventsToReplay[eventsToReplay.length - 1].createdAt.toISOString() : undefined,
    };
  }

  async getEventTimeline(entityId: string): Promise<EventTimeline> {
    const eventData = await this.eventModel.findOne({ id: entityId }).lean();

    if (!eventData?.events?.length) {
      return {
        events: [],
        totalEvents: 0,
      };
    }

    const timelineEvents = eventData.events.map(event => ({
      eventName: event.eventName,
      timestamp: event.createdAt.toISOString(),
      changes: this.extractChangesFromPayload(event.payload, event.eventName),
    }));

    return {
      events: timelineEvents,
      totalEvents: eventData.events.length,
      firstEventAt: eventData.events[0]?.createdAt.toISOString(),
      lastEventAt: eventData.events[eventData.events.length - 1]?.createdAt.toISOString(),
    };
  }

  async getEventStatistics(entityId: string): Promise<EventStatistics> {
    const eventData = await this.eventModel.findOne({ id: entityId }).lean();

    if (!eventData?.events?.length) {
      return {
        totalEvents: 0,
        eventsByType: {},
      };
    }

    const eventsByType: Record<string, number> = {};
    eventData.events.forEach(event => {
      eventsByType[event.eventName] = (eventsByType[event.eventName] || 0) + 1;
    });

    // Calculate average time between events
    let averageTimeBetweenEvents: number | undefined;
    if (eventData.events.length > 1) {
      const firstEvent = new Date(eventData.events[0].createdAt);
      const lastEvent = new Date(eventData.events[eventData.events.length - 1].createdAt);
      const totalTime = lastEvent.getTime() - firstEvent.getTime();
      averageTimeBetweenEvents = totalTime / (eventData.events.length - 1);
    }

    return {
      totalEvents: eventData.events.length,
      eventsByType,
      firstEventAt: eventData.events[0]?.createdAt.toISOString(),
      lastEventAt: eventData.events[eventData.events.length - 1]?.createdAt.toISOString(),
      averageTimeBetweenEvents,
    };
  }

  async getEntityEvents(entityId: string, eventTypes?: string[]): Promise<EventRecord[]> {
    const eventData = await this.eventModel.findOne({ id: entityId }).lean();

    if (!eventData?.events?.length) {
      return [];
    }

    let filteredEvents = eventData.events;

    if (eventTypes && eventTypes.length > 0) {
      filteredEvents = eventData.events.filter(event => 
        eventTypes.includes(event.eventName)
      );
    }

    return filteredEvents.map(event => ({
      eventName: event.eventName,
      payload: event.payload,
      createdAt: event.createdAt,
    }));
  }

  async compareStates<T = any>(entityId: string, fromDate: Date, toDate: Date): Promise<{
    entityId: string;
    period: { from: string; to: string };
    stateComparison: {
      before: T | null;
      after: T | null;
      changes: Array<{ field: string; from: any; to: any }>;
    };
    eventsInPeriod: Array<{
      timestamp: string;
      action: string;
      details: any;
    }>;
  }> {
    const beforeState = await this.getStateAtTime<T>(entityId, fromDate);
    const afterState = await this.getStateAtTime<T>(entityId, toDate);

    // Get events in the period
    const eventData = await this.eventModel.findOne({ id: entityId }).lean();
    const eventsInPeriod = eventData?.events?.filter(event => {
      const eventDate = new Date(event.createdAt);
      return eventDate >= fromDate && eventDate <= toDate;
    }) || [];

    // Calculate changes
    const changes = this.calculateStateChanges(beforeState.currentState, afterState.currentState);

    return {
      entityId,
      period: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      stateComparison: {
        before: beforeState.currentState,
        after: afterState.currentState,
        changes,
      },
      eventsInPeriod: eventsInPeriod.map(event => ({
        timestamp: event.createdAt.toISOString(),
        action: event.eventName,
        details: event.payload,
      })),
    };
  }

  async getStreamBatch(entityId: string, batchNumber: number, batchSize: number = 50): Promise<StreamBatch> {
    const eventData = await this.eventModel.findOne({ id: entityId }).lean();

    if (!eventData?.events?.length) {
      return {
        batch: [],
        batchNumber,
        totalProcessed: 0,
        hasMore: false,
        metadata: {
          entityId,
          batchSize,
        },
      };
    }

    const startIndex = (batchNumber - 1) * batchSize;
    const endIndex = startIndex + batchSize;
    const batch = eventData.events.slice(startIndex, endIndex);
    const hasMore = endIndex < eventData.events.length;

    // Build current state up to this batch
    const eventsUpToBatch = eventData.events.slice(0, endIndex);
    const currentState = this.replayEventsToState(eventsUpToBatch, entityId);

    return {
      batch: batch.map(event => ({
        eventName: event.eventName,
        payload: event.payload,
        createdAt: event.createdAt,
      })),
      batchNumber,
      totalProcessed: endIndex,
      hasMore,
      metadata: {
        entityId,
        batchSize,
        currentState,
      },
    };
  }

  private replayEventsToState<T>(events: any[], entityId: string): T {
    return events.reduce<T>(
      (state, event) => ({
        ...state,
        ...this.removeNulls(event.payload),
      }),
      { id: entityId } as T,
    );
  }

  private removeNulls<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== null),
    ) as Partial<T>;
  }

  private extractChangesFromPayload(payload: any, eventName: string): string[] {
    const changes: string[] = [];
    
    switch (eventName) {
      case 'user-created-event':
        changes.push(`User created with email: ${payload.email}`);
        if (payload.name) changes.push(`Name set to: ${payload.name}`);
        if (payload.role) changes.push(`Role set to: ${payload.role}`);
        break;
      case 'user-updated-event':
        Object.keys(payload).forEach(key => {
          if (key !== 'id' && payload[key] !== null) {
            changes.push(`${key} updated to: ${payload[key]}`);
          }
        });
        break;
      default:
        changes.push(`Event: ${eventName}`);
        break;
    }

    return changes;
  }

  private calculateStateChanges<T>(before: T | null, after: T | null): Array<{ field: string; from: any; to: any }> {
    const changes: Array<{ field: string; from: any; to: any }> = [];

    if (!before && !after) return changes;
    if (!before) {
      // Object was created
      if (after && typeof after === 'object') {
        Object.keys(after).forEach(key => {
          changes.push({ field: key, from: null, to: (after as any)[key] });
        });
      }
      return changes;
    }
    if (!after) {
      // Object was deleted
      if (before && typeof before === 'object') {
        Object.keys(before).forEach(key => {
          changes.push({ field: key, from: (before as any)[key], to: null });
        });
      }
      return changes;
    }

    // Compare objects
    if (typeof before === 'object' && typeof after === 'object') {
      const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
      allKeys.forEach(key => {
        const beforeValue = (before as any)[key];
        const afterValue = (after as any)[key];
        if (beforeValue !== afterValue) {
          changes.push({ field: key, from: beforeValue, to: afterValue });
        }
      });
    }

    return changes;
  }
}