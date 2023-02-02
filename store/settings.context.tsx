// import { useReducer, useContext, createContext } from "react";

// interface ISettingsContext {
// 	dynamicGrading: boolean;
// 	direction: {
// 		spanishToEnglish: boolean;
// 		englishToSpanish: boolean;
// 	};
// }

// interface ISettingsProviderValue extends ISettingsContext {
// 	toggleDynamicGrading: () => void;
// 	updateDirection: (field: "spanishToEnglish" | "englishToSpanish") => void;
// }

// type Action =
// 	| { type: "TOGGLE_DYNAMIC_GRADING" }
// 	| { type: "UPDATE_DIRECTION"; value: "spanishToEnglish" | "englishToSpanish" };

// type ISettingsProviderProps = {
// 	children: React.ReactNode;
// };

// const SettingsContext = createContext<ISettingsContext>({
// 	dynamicGrading: false,
// 	direction: {
// 		spanishToEnglish: true,
// 		englishToSpanish: false
// 	}
// });

// const settingsReducer = (state: ISettingsContext, action: Action) => {
// 	const newState = { ...state };

// 	switch (action.type) {
// 		case "TOGGLE_DYNAMIC_GRADING":
// 			newState.dynamicGrading = !newState.dynamicGrading;
// 			break;
// 		case "UPDATE_DIRECTION":
// 			const field = action.value;
// 			newState.direction[field] = !newState.direction[field];

// 			if (!newState.direction.spanishToEnglish && !newState.direction.englishToSpanish) {
// 				const complementaryField =
// 					field === "spanishToEnglish" ? "englishToSpanish" : "spanishToEnglish";

// 				newState.direction[complementaryField] = true;
// 			}
// 			break;
// 		default:
// 			throw new Error("Invalid action type");
// 	}

//     localStorage.setItem("settings", JSON.stringify(newState));

// 	return newState;
// };

// export const useSettings = () => {
// 	return useContext(SettingsContext) as ISettingsProviderValue;
// };

// export const SettingsContextProvider = ({ children }: ISettingsProviderProps) => {
// 	const storedSettings = localStorage.getItem("settings");
// 	const parsedStoredSettings = storedSettings ? JSON.parse(storedSettings) : null;

// 	const [state, dispatch] = useReducer(
// 		settingsReducer,
// 		parsedStoredSettings
// 			? parsedStoredSettings
// 			: {
// 					dynamicGrading: false,
// 					direction: {
// 						spanishToEnglish: true,
// 						englishToSpanish: false
// 					}
// 			  }
// 	);

// 	const toggleDynamicGrading = () => {
// 		dispatch({ type: "TOGGLE_DYNAMIC_GRADING" });
// 	};

// 	const updateDirection = (field: "spanishToEnglish" | "englishToSpanish") => {
// 		dispatch({ type: "UPDATE_DIRECTION", value: field });
// 	};

// 	const providerValue: ISettingsProviderValue = {
// 		...state,
// 		toggleDynamicGrading,
// 		updateDirection
// 	};

// 	return <SettingsContext.Provider value={providerValue}>{children}</SettingsContext.Provider>;
// };

import { useReducer, useContext, createContext } from "react";

interface ISettingsContext {
    dailyTarget: number;
	dynamicGrading: boolean;
	direction: {
		spanishToEnglish: boolean;
		englishToSpanish: boolean;
	};
    updateDailyTarget: (value: number) => void;
    toggleDynamicGrading: () => void;
    updateDirection: (field: "spanishToEnglish" | "englishToSpanish") => void;
}

type Action =
    { type: "UPDATE_DAILY_TARGET"; value: number }
	| { type: "TOGGLE_DYNAMIC_GRADING" }
	| { type: "UPDATE_DIRECTION"; value: "spanishToEnglish" | "englishToSpanish" };

interface ISettingsProviderProps<T> {
	children: T;
}

const SettingsContext = createContext<ISettingsContext>({
    dailyTarget: 5,
	dynamicGrading: false,
	direction: {
		spanishToEnglish: true,
		englishToSpanish: false
    },
    updateDailyTarget: () => {},
    toggleDynamicGrading: () => {},
    updateDirection: () => {}
});

const settingsReducer = (state: ISettingsContext, action: Action): ISettingsContext => {
    const newState = { ...state };
	switch (action.type) {
        case "UPDATE_DAILY_TARGET":
            newState.dailyTarget = action.value;
            break;
		case "TOGGLE_DYNAMIC_GRADING":
            newState.dynamicGrading = !newState.dynamicGrading;
            break;
		case "UPDATE_DIRECTION":
			const field = action.value;
			const newDirection = {
				...state.direction,
				[field]: !state.direction[field]
			};
			if (!newDirection.spanishToEnglish && !newDirection.englishToSpanish) {
				const complementaryField =
					field === "spanishToEnglish" ? "englishToSpanish" : "spanishToEnglish";
				newDirection[complementaryField] = true;
			}
			
            newState.direction = newDirection;
            break;
		default:
			throw new Error("Invalid action type");
        }
        
        if (typeof window !== "undefined") {
            localStorage.setItem("settings", JSON.stringify(newState));
        }

        return newState;
};

export const useSettings = () => {
	return useContext(SettingsContext);
};

export const SettingsContextProvider = <T extends React.ReactNode>({
	children
}: ISettingsProviderProps<T>) => {
    let storedSettings = null
    
    if (typeof window !== "undefined") {
        storedSettings = localStorage.getItem("settings");
    }
	const parsedStoredSettings = storedSettings ? JSON.parse(storedSettings) : null;

	const [state, dispatch] = useReducer(
		settingsReducer,
		parsedStoredSettings
			? parsedStoredSettings
			: {
                    dailyTarget: 5,
					dynamicGrading: false,
					direction: {
						spanishToEnglish: true,
						englishToSpanish: false
					}
			  }
	);

    const updateDailyTarget = (value: number) => {
        dispatch({ type: "UPDATE_DAILY_TARGET", value });
    }

	const toggleDynamicGrading = () => {
		dispatch({ type: "TOGGLE_DYNAMIC_GRADING" });
	};

	const updateDirection = (field: "spanishToEnglish" | "englishToSpanish") => {
		dispatch({ type: "UPDATE_DIRECTION", value: field });
	};

	const providerValue: ISettingsContext = {
		...state,
        updateDailyTarget,
		toggleDynamicGrading,
		updateDirection
	};

	return <SettingsContext.Provider value={providerValue}>{children}</SettingsContext.Provider>;
};
