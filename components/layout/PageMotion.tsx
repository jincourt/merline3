import { MotionDiv } from "@/components/ui/motion";

export function PageMotion({
  children,
  className = "",
  delay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <MotionDiv className={className} delay={delay}>
      {children}
    </MotionDiv>
  );
}
