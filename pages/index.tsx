import Head from 'next/head'
import styles from '../styles/index.module.css'
import Content from '../components/Content'
import Modal from '../components/Modal'
import { useEffect, useState } from 'react'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'
import { SettingsContextProvider } from '../store/settings.context'

export default function Index() {
    const [modalStatus, setModalStatus] = useState<'open' | 'closing' | 'closed'>('closed')

	return (
		<>
			<Head>
				<title>Syntilla</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
            <header id = {styles.header}>
                <h1 data-text = 'Syntilla'>Syntilla</h1>
                <button
                    id = {styles.settingsButton}
                    onClick = {() => setModalStatus('open')}
                >
                    <HiOutlineCog6Tooth color='white' width = '2em'/>
                </button>
            </header>
			<main className = { styles.main }>
                <SettingsContextProvider>
                    <Modal 
                        modalStatus = {modalStatus} 
                        setModalStatus = {setModalStatus}
                    />
                    <Content />
                </SettingsContextProvider>
			</main>
		</>
	)
}
