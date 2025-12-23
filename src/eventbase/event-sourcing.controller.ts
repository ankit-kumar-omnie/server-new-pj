import { Controller, Get, Param, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { EventSourcingService } from './event-sourcing.service';
import { EventSourcingResult, EventTimeline, EventStatistics, StreamBatch } from './interfaces/event-sourcing.interfaces';

@ApiTags('Event Sourcing')
@Controller('events')
export class EventSourcingController {
  constructor(private readonly eventSourcingService: EventSourcingService) {}

  @Get(':entityId/replay')
  @ApiOperation({ summary: 'Replay events for an entity' })
  @ApiParam({ name: 'entityId', description: 'Entity ID to replay events for' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Start date for event filtering' })
  @ApiQuery({ name: 'toDate', required: false, description: 'End date for event filtering' })
  @ApiQuery({ name: 'eventTypes', required: false, description: 'Comma-separated list of event types to filter' })
  @ApiQuery({ name: 'batchSize', required: false, description: 'Batch size for processing' })
  @ApiResponse({ status: 200, description: 'Events replayed successfully' })
  async replayEvents(
    @Param('entityId') entityId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('eventTypes') eventTypes?: string,
    @Query('batchSize') batchSize?: string,
  ): Promise<EventSourcingResult> {
    const options: any = {};

    if (fromDate) {
      options.fromDate = new Date(fromDate);
      if (isNaN(options.fromDate.getTime())) {
        throw new BadRequestException('Invalid fromDate format');
      }
    }

    if (toDate) {
      options.toDate = new Date(toDate);
      if (isNaN(options.toDate.getTime())) {
        throw new BadRequestException('Invalid toDate format');
      }
    }

    if (eventTypes) {
      options.eventTypes = eventTypes.split(',').map(type => type.trim());
    }

    if (batchSize) {
      options.batchSize = parseInt(batchSize, 10);
      if (isNaN(options.batchSize) || options.batchSize <= 0) {
        throw new BadRequestException('Invalid batchSize');
      }
    }

    return this.eventSourcingService.replayEvents(entityId, options);
  }

  @Get(':entityId/state-at/:timestamp')
  @ApiOperation({ summary: 'Get entity state at a specific timestamp' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiParam({ name: 'timestamp', description: 'ISO timestamp' })
  @ApiResponse({ status: 200, description: 'State retrieved successfully' })
  async getStateAtTime(
    @Param('entityId') entityId: string,
    @Param('timestamp') timestamp: string,
  ): Promise<EventSourcingResult> {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid timestamp format');
    }

    return this.eventSourcingService.getStateAtTime(entityId, date);
  }

  @Get(':entityId/state-after/:eventCount')
  @ApiOperation({ summary: 'Get entity state after a specific number of events' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiParam({ name: 'eventCount', description: 'Number of events to replay' })
  @ApiResponse({ status: 200, description: 'State retrieved successfully' })
  async getStateAfterEvents(
    @Param('entityId') entityId: string,
    @Param('eventCount', ParseIntPipe) eventCount: number,
  ): Promise<EventSourcingResult> {
    if (eventCount < 0) {
      throw new BadRequestException('Event count must be non-negative');
    }

    return this.eventSourcingService.getStateAfterEvents(entityId, eventCount);
  }

  @Get(':entityId/timeline')
  @ApiOperation({ summary: 'Get event timeline for an entity' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Timeline retrieved successfully' })
  async getEventTimeline(@Param('entityId') entityId: string): Promise<EventTimeline> {
    return this.eventSourcingService.getEventTimeline(entityId);
  }

  @Get(':entityId/statistics')
  @ApiOperation({ summary: 'Get event statistics for an entity' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getEventStatistics(@Param('entityId') entityId: string): Promise<EventStatistics> {
    return this.eventSourcingService.getEventStatistics(entityId);
  }

  @Get(':entityId/events')
  @ApiOperation({ summary: 'Get events for an entity' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiQuery({ name: 'eventTypes', required: false, description: 'Comma-separated list of event types to filter' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getEntityEvents(
    @Param('entityId') entityId: string,
    @Query('eventTypes') eventTypes?: string,
  ) {
    const eventTypeArray = eventTypes ? eventTypes.split(',').map(type => type.trim()) : undefined;
    return this.eventSourcingService.getEntityEvents(entityId, eventTypeArray);
  }

  @Get(':entityId/compare')
  @ApiOperation({ summary: 'Compare entity states between two dates' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiQuery({ name: 'fromDate', description: 'Start date for comparison' })
  @ApiQuery({ name: 'toDate', description: 'End date for comparison' })
  @ApiResponse({ status: 200, description: 'State comparison retrieved successfully' })
  async compareStates(
    @Param('entityId') entityId: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    if (!fromDate || !toDate) {
      throw new BadRequestException('Both fromDate and toDate are required');
    }

    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (fromDateObj >= toDateObj) {
      throw new BadRequestException('fromDate must be before toDate');
    }

    return this.eventSourcingService.compareStates(entityId, fromDateObj, toDateObj);
  }

  @Get(':entityId/stream/:batchNumber')
  @ApiOperation({ summary: 'Get a batch of events from the stream' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiParam({ name: 'batchNumber', description: 'Batch number (1-based)' })
  @ApiQuery({ name: 'batchSize', required: false, description: 'Size of each batch (default: 50)' })
  @ApiResponse({ status: 200, description: 'Stream batch retrieved successfully' })
  async getStreamBatch(
    @Param('entityId') entityId: string,
    @Param('batchNumber', ParseIntPipe) batchNumber: number,
    @Query('batchSize') batchSize?: string,
  ): Promise<StreamBatch> {
    if (batchNumber < 1) {
      throw new BadRequestException('Batch number must be positive');
    }

    let parsedBatchSize = 50; // default
    if (batchSize) {
      parsedBatchSize = parseInt(batchSize, 10);
      if (isNaN(parsedBatchSize) || parsedBatchSize <= 0 || parsedBatchSize > 1000) {
        throw new BadRequestException('Batch size must be between 1 and 1000');
      }
    }

    return this.eventSourcingService.getStreamBatch(entityId, batchNumber, parsedBatchSize);
  }
}