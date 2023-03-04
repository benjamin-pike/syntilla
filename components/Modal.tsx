import { ModalProps } from '../types/types'
import styles from '../styles/modal.module.css'

const Modal: React.FC<ModalProps> = ({children, title, modalStatus, setModalStatus }) => {
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
                        {/* <h1 className = {styles.modalHeader}>
                            {title}
                        </h1> */}
                        <div className = {styles.modalBody}>
                            {children}
                        </div>
                        <button 
                            className = {styles.closeButton}
                            onClick = {handleModalClose}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Modal;