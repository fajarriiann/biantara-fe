import {useEffect} from "react";

const Alert = ({ type, message, onClose }) => {
    const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
    const textColor = type === 'error' ? 'text-red-700' : 'text-green-700';
    const borderColor = type === 'error' ? 'border-red-300' : 'border-green-300';

    useEffect(() => {
        if (onClose) {
            const timer = setTimeout(onClose, type === 'success' ? 2500 : 5000);
            return () => clearTimeout(timer);
        }
    }, [onClose, type]);

    return (
        <div className={`${bgColor} ${textColor} p-3 mb-4 rounded-lg border ${borderColor}`}>
            {message}
        </div>
    );
};
export default Alert;