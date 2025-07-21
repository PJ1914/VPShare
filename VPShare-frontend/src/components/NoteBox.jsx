import React from 'react';
import { Info, Lightbulb, Warning, Whatshot } from '@mui/icons-material';
import '../styles/CourseDetail.css';

const noteStyles = {
    note: {
        icon: <Info />,
        className: 'note-box-note',
    },
    tip: {
        icon: <Lightbulb />,
        className: 'note-box-tip',
    },
    warning: {
        icon: <Warning />,
        className: 'note-box-warning',
    },
    important: {
        icon: <Whatshot />,
        className: 'note-box-important',
    },
};

const NoteBox = ({ type = 'note', children }) => {
    const { icon, className } = noteStyles[type] || noteStyles.note;

    return (
        <div className={`note-box ${className}`}>
            <div className="note-box-icon">{icon}</div>
            <div className="note-box-content">{children}</div>
        </div>
    );
};

export default NoteBox;
