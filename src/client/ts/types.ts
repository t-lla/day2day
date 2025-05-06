/**
 * @packageDocumentation
 * @module Types
 *
 * Defines shared data interfaces used across the application,
 * including Note and Task structures.
 */

/**
 * Represents a note entry in the application.
 *
 * @example
 * const note: Note = {
 *   id: "1",
 *   title: "new note",
 *   content: "note content",
 *   createdAt: "2025-05-03T10:00:00Z",
 *   updatedAt: "2025-05-03T10:00:00Z",
 *   tags: ["new", "note"]
 * };
 */
export interface Note {
  /** Unique identifier for the note. */
  id: string;

  /** Title/heading of the note. */
  title: string;

  /** Main content or body text of the note. */
  content: string;

  /** ISO timestamp string when the note was created. */
  createdAt: string;

  /** ISO timestamp string when the note was last updated. */
  updatedAt: string;

  /** Array of tags within note. */
  tags: string[];
}

/**
 * Represents a task entry in the application.
 *
 * @example
 * const task: Task = {
 *   id: "1",
 *   title: "new task",
 *   description: "task content",
 *   dueDate: "10-05-2025",
 *   priority: "high",
 *   completed: false,
 *   createdAt: "2025-05-03T10:00:00Z"
 * };
 */
export interface Task {
  /** Unique identifier for the task. */
  id: string;

  /** Title/heading of the task. */
  title: string;

  /** Detailed description of the task. */
  description: string;

  /** Due date for the task in DD-MM-YYYY format, or null if none set. */
  dueDate: string | null;

   /** Priority level of the task: low, medium, or high. */
  priority: "low" | "medium" | "high";

  /** Completion status of the task. */
  completed: boolean;

  /** Completion status of the task. */
  createdAt: string;
}


export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  completedDates: string[];
  createdAt: string;
}