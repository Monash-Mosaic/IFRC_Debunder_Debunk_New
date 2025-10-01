import StartButton from './components/StartButton.jsx';

export default function Page() {
  const randomIndex = Math.floor(Math.random() * 20);
  return (
    <main className="screen">
      <div className="content" style={{ textAlign: 'center' }}>
        <h1 className="title">CTRL + ALT + PREBUNK</h1>
        <div className="buttons">
          <button className="btn btn-outline">TUTORIAL</button>
          <StartButton />
        </div>
      </div>
    </main>
  );
}
