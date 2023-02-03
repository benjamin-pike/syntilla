import Head from 'next/head'
import styles from '../styles/index.module.css'
import Content from '../components/Content'
import Modal from '../components/Modal'
import { useState, useEffect } from 'react'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'
import { IoMdHeartEmpty } from 'react-icons/io'
import { AiOutlineFire } from 'react-icons/ai'
import { SettingsContextProvider } from '../store/settings.context'
import { useUserProgress } from '../hooks/useUserProgress'

export default function Index() {
    const [modalStatus, setModalStatus] = useState<'open' | 'closing' | 'closed'>('closed')
    const [streakLength, setStreakLength] = useState<number>(-1)

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
                        onClick = {() => {}}
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
                        onClick = {() => setModalStatus('open')}
                    >
                        <HiOutlineCog6Tooth />
                    </button>
                </div>
            </header>
			<main className = { styles.main }>
                <SettingsContextProvider>
                    <Modal 
                        modalStatus = {modalStatus} 
                        setModalStatus = {setModalStatus}
                    />
                    <Content 
                        setStreakLength = {setStreakLength}
                    />
                </SettingsContextProvider>
			</main>
		</>
	)
}
