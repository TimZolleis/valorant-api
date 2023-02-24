type TagProps = {
    text: string;
    color: string;
    textColor: string;
    borderColor: string;
};

export const Tag = ({ text, color, textColor, borderColor }: TagProps) => {
    return (
        <div className={`${color} rounded-md px-3 py-1 border ${borderColor}`}>
            <p className={`${textColor} font-inter text-xs`}>{text}</p>
        </div>
    );
};
