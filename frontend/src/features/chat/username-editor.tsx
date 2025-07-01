"use client";

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Edit3, Check, X } from 'lucide-react';

interface UsernameEditorProps {
  currentUsername: string;
  onUsernameChange: (newUsername: string) => void;
}

export default function UsernameEditor({ currentUsername, onUsernameChange }: UsernameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUsername);

  const handleSave = () => {
    if (newUsername.trim() && newUsername.trim() !== currentUsername) {
      onUsernameChange(newUsername.trim());
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('rapid-dev-chat-username', newUsername.trim());
      }
    }
    setIsEditing(false);
    setNewUsername(currentUsername);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewUsername(currentUsername);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Card className="w-64">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Edit Username</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter username..."
            className="text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!newUsername.trim()}
              className="flex-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-64">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          Your Identity
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsEditing(true)}
            className="h-6 w-6 p-0"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-lg font-medium text-blue-600">
            {currentUsername}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Click edit to change
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 