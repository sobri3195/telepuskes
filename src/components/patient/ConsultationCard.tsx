import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { Consultation } from '@/types';
import { formatTime } from '@/lib/utils';
import { TriageBadge } from './TriageBadge';

export function ConsultationCard({ c }: { c: Consultation }) {
  return (
    <Link to={`/app/consultations/${c.id}`}>
      <Card className="hover:border-primary">
        <CardContent className="space-y-2 pt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <b className="min-w-0 break-words">{c.title}</b>
            <TriageBadge priority={c.priority} />
          </div>
          <p className="text-sm text-muted-foreground">{c.summary}</p>
          <div className="flex flex-wrap justify-between gap-2 text-xs"><span>{c.status}</span><span>{formatTime(c.createdAt)}</span></div>
        </CardContent>
      </Card>
    </Link>
  );
}
