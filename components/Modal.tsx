import { useSettings } from '../store/settings.context'
import styles from '../styles/modal.module.css'

interface ModalProps {
    modalStatus: 'open' | 'closing' | 'closed'
    setModalStatus: React.Dispatch<React.SetStateAction<'open' | 'closing' | 'closed'>>
}

const Modal: React.FC<ModalProps> = ({ modalStatus, setModalStatus }) => {
    const { dynamicGrading, direction, toggleDynamicGrading, updateDirection } = useSettings()

    const handleModalClose = () => {
        setModalStatus('closing')
        setTimeout(() => {
            setModalStatus('closed')
        }, 500)
    }

    return (
        <>
            {modalStatus !== 'closed' && (
                <div className = {styles.modalContainer} data-status = {modalStatus}>
                    <div className = {styles.modal}>
                        <h1 className = {styles.modalHeader}>
                            Settings
                        </h1>
                        <div className = {styles.modalBody}>
                            <p className = {styles.settingsLabel}>Use dynamic grading</p>
                            <div className = {styles.settingsSelector}>
                                <div className = {styles.toggleContainer}>
                                    <input 
                                        type="checkbox" 
                                        id = 'dynamic-grading'
                                        onChange = { toggleDynamicGrading }
                                        checked = { dynamicGrading }
                                    />
                                    <label htmlFor = 'dynamic-grading' />
                                </div>
                            </div>
                            <p className = {styles.settingsLabel}>Spanish  →  English</p>
                            <div className = {styles.settingsSelector}>
                                <div className = {styles.toggleContainer}>
                                    <input
                                        type = "checkbox" 
                                        id = 'spanishToEnglish'
                                        onChange = { () => updateDirection('spanishToEnglish') }
                                        checked = { direction.spanishToEnglish }
                                    />
                                    <label htmlFor = 'spanishToEnglish' />
                                </div>
                            </div>
                            <p className = {styles.settingsLabel}>English  →  Spanish</p>
                            <div className = {styles.settingsSelector}>
                                <div className = {styles.toggleContainer}>
                                    <input 
                                        type = "checkbox" 
                                        id = 'englishToSpanish'
                                        onChange = { () => updateDirection('englishToSpanish') }
                                        checked = { direction.englishToSpanish } 
                                    />
                                    <label htmlFor = 'englishToSpanish' />
                                </div>
                            </div>
                        </div>
                        <button 
                            className = {styles.closeButton}
                            onClick = {handleModalClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Modal;