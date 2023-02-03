import { ModalStatusProps } from "../types/types";
import Modal from "./Modal";
import styles from '../styles/progress-modal.module.css'

export const ProgressModal: React.FC<ModalStatusProps> = ({ modalStatus, setModalStatus }) => {
    return (
        <Modal 
            title = 'Progress'
            modalStatus = { modalStatus }
            setModalStatus = { setModalStatus }
        >
            <div id = {styles.content}>
                <h2 id = {styles.comingSoon}>Coming Soon!</h2>
            </div>
        </Modal>
    )
}