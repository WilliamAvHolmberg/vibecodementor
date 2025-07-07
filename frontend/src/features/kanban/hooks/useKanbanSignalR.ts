"use client";

import { useState, useEffect, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

interface KanbanSignalRUpdate {
  type: 'BoardCreated' | 'TaskCreated' | 'TaskMoved' | 'TaskUpdated';
  boardId: string;
  taskId?: string;
  title?: string;
  columnName?: string;
  fromColumn?: string;
  toColumn?: string;
  updateType?: string;
  userId: string;
  timestamp: string;
}

export function useKanbanSignalR() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState<KanbanSignalRUpdate[]>([]);

  useEffect(() => {
    // Create SignalR connection to kanban hub
    const newConnection = new HubConnectionBuilder()
      .withUrl('/hubs/kanban')
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          setConnected(true);
          console.log('🎯 Kanban SignalR connected');
        })
        .catch(error => {
          console.error('❌ Kanban SignalR Connection Error:', error);
          setConnected(false);
        });

      connection.onclose(() => {
        setConnected(false);
        console.log('🔌 Kanban SignalR disconnected');
      });

      connection.onreconnecting(() => {
        setConnected(false);
        console.log('🔄 Kanban SignalR reconnecting...');
      });

      connection.onreconnected(() => {
        setConnected(true);
        console.log('✅ Kanban SignalR reconnected');
      });

      // Listen for kanban updates
      connection.on('KanbanUpdate', (update: KanbanSignalRUpdate) => {
        console.log('📋 Kanban update received:', update);
        setUpdates(prev => [...prev, update]);
      });

      // Listen for board join confirmations
      connection.on('JoinedBoard', (boardId: string) => {
        console.log('👥 Joined board:', boardId);
      });

      connection.on('LeftBoard', (boardId: string) => {
        console.log('👋 Left board:', boardId);
      });
    }

    return () => {
      if (connection) {
        connection.off('KanbanUpdate');
        connection.off('JoinedBoard');
        connection.off('LeftBoard');
      }
    };
  }, [connection]);

  // Join a specific board for updates
  const joinBoard = useCallback(async (boardId: string) => {
    if (connection && connected) {
      try {
        await connection.invoke('JoinBoard', boardId);
        console.log('🎯 Joined board group:', boardId);
      } catch (error) {
        console.error('❌ Failed to join board:', error);
      }
    }
  }, [connection, connected]);

  // Leave a specific board
  const leaveBoard = useCallback(async (boardId: string) => {
    if (connection && connected) {
      try {
        await connection.invoke('LeaveBoard', boardId);
        console.log('👋 Left board group:', boardId);
      } catch (error) {
        console.error('❌ Failed to leave board:', error);
      }
    }
  }, [connection, connected]);

  // Join multiple boards at once
  const joinBoards = useCallback(async (boardIds: string[]) => {
    if (connection && connected) {
      try {
        await connection.invoke('JoinBoards', boardIds);
        console.log('👥 Joined boards:', boardIds);
      } catch (error) {
        console.error('❌ Failed to join boards:', error);
      }
    }
  }, [connection, connected]);

  // Clear updates
  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    connection,
    connected,
    updates,
    joinBoard,
    leaveBoard,
    joinBoards,
    clearUpdates
  };
} 