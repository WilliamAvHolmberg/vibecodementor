import { KanbanBoardPage } from '@/features/kanban';

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  return <KanbanBoardPage boardId={boardId} />;
}

export const metadata = {
  title: 'Kanban Board | LLM-Controlled Task Management',
  description: 'Manage your kanban board through natural language chat with AI assistance',
}; 