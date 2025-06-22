import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'wouter';

export function FloatingActionButton() {
  return (
    <Link href="/sales">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 z-40"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </Link>
  );
}
