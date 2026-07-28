import { ReactNode, useEffect, useState } from 'react'
import './App.css'
import Frame from './components/Frame'
import Player from './components/Player'
import History from './components/History'
import TopSongs from './components/TopSongs'
import Schedule from './components/Schedule'
import { devMode, nuiFetch, DEFAULT_APP_DATA } from './nui'
import { AppData } from './types'

type Tab = 'listen' | 'history' | 'top' | 'schedule'

const App = () => {
    const [appData, setAppData] = useState<AppData | null>(null)
    const [tab, setTab] = useState<Tab>('listen')

    useEffect(() => {
        document.documentElement.dataset.theme = 'dark'

        if (devMode) document.body.style.visibility = 'visible'

        nuiFetch<AppData>('getAppData', undefined, DEFAULT_APP_DATA).then(setAppData)
    }, [])

    return (
        <AppProvider>
            <div className="app">
                <div className="brand">
                    <img className="brand-logo" src="logo.png" alt="" />
                    <span className="brand-name">OOC RADIO</span>
                </div>

                {appData ? (
                    <>
                        <div className="content">
                            {/* Player stays mounted so audio keeps playing on other tabs */}
                            <div style={{ display: tab === 'listen' ? undefined : 'none' }}>
                                <Player app={appData} />
                            </div>
                            {tab === 'history' && <History app={appData} />}
                            {tab === 'top' && <TopSongs app={appData} />}
                            {tab === 'schedule' && <Schedule app={appData} />}
                        </div>

                        <nav className="tab-bar">
                            <TabButton label="Listen" icon={<PlayIcon />} active={tab === 'listen'} onClick={() => setTab('listen')} />
                            <TabButton label="History" icon={<HistoryIcon />} active={tab === 'history'} onClick={() => setTab('history')} />
                            <TabButton label="Top Songs" icon={<HeartIcon />} active={tab === 'top'} onClick={() => setTab('top')} />
                            <TabButton label="Schedule" icon={<CalendarIcon />} active={tab === 'schedule'} onClick={() => setTab('schedule')} />
                        </nav>
                    </>
                ) : (
                    <div className="loading">Loading...</div>
                )}
            </div>
        </AppProvider>
    )
}

const TabButton = ({ label, icon, active, onClick }: { label: string; icon: ReactNode; active: boolean; onClick: () => void }) => (
    <button className={`tab-button ${active ? 'active' : ''}`} onClick={onClick}>
        {icon}
        <span>{label}</span>
    </button>
)

const PlayIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3a9 9 0 0 0-9 9v5a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H5a7 7 0 0 1 14 0h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1a3 3 0 0 0 3-3v-5a9 9 0 0 0-9-9Z" />
    </svg>
)

const HistoryIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v4h4" />
        <path d="M12 7v5l3.5 2" />
    </svg>
)

const HeartIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
)

const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z" />
    </svg>
)

const AppProvider = ({ children }: { children: ReactNode }) => {
    if (devMode) {
        const handleResize = () => {
            const { innerWidth, innerHeight } = window

            const aspectRatio = innerWidth / innerHeight
            const phoneAspectRatio = 27.6 / 59

            if (phoneAspectRatio < aspectRatio) {
                document.documentElement.style.fontSize = '1.66vh'
            } else {
                document.documentElement.style.fontSize = '3.4vw'
            }
        }

        useEffect(() => {
            window.addEventListener('resize', handleResize)

            return () => {
                window.removeEventListener('resize', handleResize)
            }
        }, [])

        handleResize()

        return (
            <div className="dev-wrapper">
                <Frame>{children}</Frame>
            </div>
        )
    } else return children
}

export default App
