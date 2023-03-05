import { ModalProps } from '../types/types'
import styles from '../styles/modal.module.css'

const Modal: React.FC<ModalProps> = ({children, title, modalStatus, setModalStatus }) => {
    const handleModalClose = () => {
        setModalStatus('closing')
        setTimeout(() => {
            setModalStatus('closed')
        }, 500)
    }

    const handleModalClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const target = e.target as HTMLDivElement
        if (target.id === styles.modalContainer) 
            handleModalClose()
    }

    return (
        <>
            {modalStatus !== 'closed' && (
                <div 
                    id = {styles.modalContainer} 
                    data-status = {modalStatus}
                    onClick = {handleModalClick}
                >
                    <div className = {styles.modal}>
                        <div className = {styles.modalBody}>
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Modal;