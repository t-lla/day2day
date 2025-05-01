export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
  }
  
  export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string | null;
    priority: "low" | "medium" | "high";
    completed: boolean;
    createdAt: string;
  }