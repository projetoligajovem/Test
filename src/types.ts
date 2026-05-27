/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  age?: number;
  school?: string;
  grade?: string;
  subjectsExpert: string[];
  subjectsLearning: string[];
  knowledgeLevels: Record<string, number>;
  xp: number;
  level: number;
  reputation: number;
  badges: string[];
  streak: number;
  hoursStudied: number;
  peopleHelpedCount: number;
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  title: string;
  description: string;
  subject: string;
  minLevel: number;
  availableTime: string;
  tags: string[];
  status: 'open' | 'active' | 'closed';
  chatEnabled: boolean;
  validatorQuizId?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  requestId: string;
  participants: string[];
  startTime: string;
  status: 'ongoing' | 'completed';
  notes: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  fileUrl?: string;
}

export type Subject = 'Matemática' | 'Redação' | 'Química' | 'Física' | 'Programação' | 'Idiomas';
