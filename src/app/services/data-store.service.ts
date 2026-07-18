// src/app/services/data-store.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  LoveMetric,
  TimelineEvent,
  MoodStatus,
  Message,
  LoveDashboardStats
} from '../interfaces/db-interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {
  // Love Metrics
  private loveMetricsSubject = new BehaviorSubject<LoveMetric[]>([]);
  public loveMetrics$ = this.loveMetricsSubject.asObservable();

  // Today's Metrics
  private todayMetricsSubject = new BehaviorSubject<LoveMetric | null>(null);
  public todayMetrics$ = this.todayMetricsSubject.asObservable();

  // Timeline Events
  private timelineEventsSubject = new BehaviorSubject<TimelineEvent[]>([]);
  public timelineEvents$ = this.timelineEventsSubject.asObservable();

  // Mood Status
  private moodStatusSubject = new BehaviorSubject<MoodStatus | null>(null);
  public moodStatus$ = this.moodStatusSubject.asObservable();

  // Messages
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  // Unread Messages Count
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  // Dashboard Stats
  private dashboardStatsSubject = new BehaviorSubject<LoveDashboardStats | null>(null);
  public dashboardStats$ = this.dashboardStatsSubject.asObservable();

  // Loading States
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Update methods
  setLoveMetrics(metrics: LoveMetric[]): void {
    this.loveMetricsSubject.next(metrics);
  }

  setTodayMetrics(metric: LoveMetric | null): void {
    this.todayMetricsSubject.next(metric);
  }

  setTimelineEvents(events: TimelineEvent[]): void {
    this.timelineEventsSubject.next(events);
  }

  setMoodStatus(status: MoodStatus | null): void {
    this.moodStatusSubject.next(status);
  }

  setMessages(messages: Message[]): void {
    this.messagesSubject.next(messages);
    // Update unread count
    const unread = messages.filter(msg => !msg.is_read).length;
    this.unreadCountSubject.next(unread);
  }

  setDashboardStats(stats: LoveDashboardStats | null): void {
    this.dashboardStatsSubject.next(stats);
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // Clear all data (on logout)
  clearAll(): void {
    this.loveMetricsSubject.next([]);
    this.todayMetricsSubject.next(null);
    this.timelineEventsSubject.next([]);
    this.moodStatusSubject.next(null);
    this.messagesSubject.next([]);
    this.unreadCountSubject.next(0);
    this.dashboardStatsSubject.next(null);
  }

  // Add single item methods
  addLoveMetric(metric: LoveMetric): void {
    const current = this.loveMetricsSubject.value;
    this.loveMetricsSubject.next([metric, ...current]);
  }

  updateLoveMetric(metric: LoveMetric): void {
    const current = this.loveMetricsSubject.value;
    const index = current.findIndex(m => m.id === metric.id);
    if (index !== -1) {
      current[index] = metric;
      this.loveMetricsSubject.next([...current]);
    }
  }

  addTimelineEvent(event: TimelineEvent): void {
    const current = this.timelineEventsSubject.value;
    this.timelineEventsSubject.next([event, ...current]);
  }

  addMessage(message: Message): void {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([message, ...current]);
    if (!message.is_read) {
      const currentUnread = this.unreadCountSubject.value;
      this.unreadCountSubject.next(currentUnread + 1);
    }
  }

  markMessageRead(messageId: number): void {
    const current = this.messagesSubject.value;
    const message = current.find(m => m.id === messageId);
    if (message && !message.is_read) {
      message.is_read = true;
      this.messagesSubject.next([...current]);
      const currentUnread = this.unreadCountSubject.value;
      this.unreadCountSubject.next(Math.max(0, currentUnread - 1));
    }
  }
}