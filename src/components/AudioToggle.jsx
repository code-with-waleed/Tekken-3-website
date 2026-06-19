import { useAudio } from '../context/AudioContext';

export default function AudioToggle() {
  const audio = useAudio();
  return (
    <button
      className={`audio-toggle${audio.muted ? ' muted' : ''}`}
      onClick={audio.toggle}
      title={audio.muted ? 'Unmute Audio' : 'Mute Audio'}
    >
      {audio.muted ? '🔇' : '🔊'}
    </button>
  );
}
