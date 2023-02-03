import { useSettings } from '../store/settings.context'
import Modal from './Modal'
import { ModalStatusProps } from '../types/types'
import styles from '../styles/settings-modal.module.css'

export const SettingsModal: React.FC<ModalStatusProps> = ({ modalStatus, setModalStatus }) => {
    const {
        dailyTarget,
        dynamicGrading,
        direction, 
        updateDailyTarget,
        toggleDynamicGrading, 
        updateDirection
    } = useSettings()

    const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target.value;

        if (!target){
            updateDailyTarget(0)
            return;
        } 

        if (target[0] === '0' && target.length > 1) {
            updateDailyTarget(Number(target.slice(1)));
            return;
        }

        updateDailyTarget(Number(target));
    }

    const handleTargetBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const target = e.target.value
        
        if (!target || Number(target) < 5) {
            updateDailyTarget(5)
        }

        if (Number(target) > 25) {
            updateDailyTarget(25)
        }
    }

    return (
        <Modal 
            title = 'Settings'
            modalStatus = { modalStatus }
            setModalStatus = { setModalStatus }
        >  
            <div id = {styles.content}>
                <p className = {styles.settingsLabel}>Daily sentence target</p>
                <div className = {styles.settingsSelector}>
                    <input 
                        className = {styles.settingsNumberInput}
                        type = "number"
                        value = { dailyTarget.toString() }
                        min = '5'
                        max = '25'
                        onChange = { handleTargetChange }
                        onBlur = { handleTargetBlur }
                    />
                </div>
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
                <p className = {styles.settingsLabel}>Spanish  ➔  English</p>
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
                <p className = {styles.settingsLabel}>English  ➔  Spanish</p>
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
        </Modal>
    )

}