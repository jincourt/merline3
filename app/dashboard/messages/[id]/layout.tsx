export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dashboard-conv-shell">{children}</div>;
}
