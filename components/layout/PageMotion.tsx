import { MotionDiv } from "@/components/ui/motion";

export function PageMotion({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotionDiv className={className} delay={0.05}>
      {children}
    </MotionDiv>
  );
}
