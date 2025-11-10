export default function Nothing({icon, text}: {icon: string, text: string}) {
  return (
    <>
      <div className="empty-state">
        <div className="empty-icon">{icon}</div>
        <div className="empty-text">{text}</div>
      </div>
    </>
  );
}
