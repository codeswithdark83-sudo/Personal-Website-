// A template (unlike a layout) re-mounts on every navigation, so each page fades in.
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
