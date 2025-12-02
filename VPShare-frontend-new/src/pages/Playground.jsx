import { useEffect, useState } from 'react';
import PlaygroundEditor from '../components/PlaygroundEditor';
import { Maximize2, Minimize2 } from 'lucide-react';

function Playground() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Request fullscreen on mount
        const enterFullscreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                    setIsFullscreen(true);
                }
            } catch (err) {
                console.log('Fullscreen request failed:', err);
            }
        };

        // Small delay to ensure smooth transition
        const timer = setTimeout(enterFullscreen, 100);

        // Listen for fullscreen changes
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            // Exit fullscreen when leaving playground
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.log('Fullscreen toggle failed:', err);
        }
    };

    return (
        <div className="h-screen bg-gray-950 relative">
            {/* Fullscreen toggle button */}
            <button
                onClick={toggleFullscreen}
                className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all hover:scale-110"
                title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
            >
                {isFullscreen ? (
                    <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                    <Maximize2 className="w-5 h-5 text-white" />
                )}
            </button>

            <PlaygroundEditor />
        </div>
    );
}

export default Playground;
