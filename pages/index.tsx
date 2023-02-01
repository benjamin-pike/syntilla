import Head from 'next/head'
import styles from '../styles/index.module.css'
import Content from '../components/Content'
import Modal from '../components/Modal'
import { useState } from 'react'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'
import { SettingsContextProvider } from '../store/settings.context'
import BMCLogoBase from '../public/bmc-logo-no-bg.svg'
import BMCLogoHover from '../public/bmc-logo-yellow-bg.svg'
import DonateIcon from '../public/donate.svg'

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
                    id = {styles.donateButton}
                    className = {styles.headerButton}
                    onClick = {() => window.open('https://www.buymeacoffee.com/benjpike', '_blank')}
                >
                    {/* <span>
                        <BMCLogoBase id = { styles.bmcBase } />
                        <BMCLogoHover id = { styles.bmcHover } />
                    </span> */}
                    <DonateIcon />
                </button>
                <button
                    id = {styles.settingsButton}
                    className = {styles.headerButton}
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
