import Head from 'next/head'
import styles from '../styles/index.module.css'
import Content from '../components/Content'
import { useEffect, useState } from 'react'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'
import { IoMdHeartEmpty } from 'react-icons/io'
import { AiOutlineFire } from 'react-icons/ai'
import { SettingsContextProvider } from '../store/settings.context'
import { SettingsModal } from '../components/SettingsModal'
import { ProgressModal } from '../components/ProgressModal'
import { useUserProgress } from '../hooks/useUserProgress'
import 'react-tooltip/dist/react-tooltip.css'

type ModalStatus = 'open' | 'closing' | 'closed'

export default function Index() {
    const [settingsModalStatus, setSettingsModalStatus] = useState<ModalStatus>('closed')
    const [progressModalStatus, setProgressModalStatus] = useState<ModalStatus>('closed')
    const [streakLength, setStreakLength] = useState<number>(-1)
    const [activeDays, setActiveDays] = useState<number>(0)

    return (
		<>
			<Head>
				<title>Syntilla</title>
                <link rel="shortcut icon" href="/favicon.png" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
            <header id = {styles.header}>
                <div id = {styles.headerContent}>
                    <button
                        id = {styles.statsButton}
                        className = {styles.headerButton}
                        onClick = {() => setProgressModalStatus('open')}
                        disabled = {activeDays === 0}
                    >
                        <div id = {styles.statsBars}>
                            <div className = {styles.statsBar} />
                            <div className = {styles.statsBar} />
                            <div className = {styles.statsBar} />
                        </div>
                    </button>
                    <div 
                        id = {styles.dailyStreak}
                        data-streak-length = {streakLength}
                    >
                        <AiOutlineFire />
                    </div>
                    <h1 data-text = 'Syntilla'>Syntilla</h1>
                    <button
                        id = {styles.donateButton}
                        className = {styles.headerButton}
                        onClick = {() => window.open('https://www.buymeacoffee.com/benjpike', '_blank')}
                    >
                        <IoMdHeartEmpty />
                    </button>
                    <button
                        id = {styles.settingsButton}
                        className = {styles.headerButton}
                        onClick = {() => setSettingsModalStatus('open')}
                    >
                        <HiOutlineCog6Tooth />
                    </button>
                </div>
            </header>
			<main className = { styles.main }>
                <SettingsContextProvider>
                    <SettingsModal 
                        modalStatus = {settingsModalStatus} 
                        setModalStatus = {setSettingsModalStatus}
                    />
                    <ProgressModal
                        modalStatus = {progressModalStatus}
                        setModalStatus = {setProgressModalStatus}
                        activeDays = {activeDays}
                    />
                    <Content 
                        modalIsOpen = {settingsModalStatus === 'open' || progressModalStatus === 'open'}
                        setStreakLength = {setStreakLength}
                        setActiveDays = {setActiveDays}
                    />
                </SettingsContextProvider>
			</main>
		</>
	)
}
