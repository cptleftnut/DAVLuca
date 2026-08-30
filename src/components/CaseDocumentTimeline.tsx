import { Timeline, TimelineProps } from './Timeline';

export interface CaseDocumentTimelineProps extends TimelineProps {}

export function CaseDocumentTimeline(props: CaseDocumentTimelineProps) {
  return <Timeline {...props} />;
}

export default CaseDocumentTimeline;
