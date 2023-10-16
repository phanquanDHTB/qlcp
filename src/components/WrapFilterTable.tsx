import { useRef, PropsWithChildren } from "react";
import { useOnClickOutside } from "usehooks-ts";

type WrapFilterTableType = PropsWithChildren<{
    onClickOutSide: () => void;

}>


const WrapFilterTable = ({ children, onClickOutSide }: WrapFilterTableType) => {

    const ref = useRef<any>();

    const onOutSide = () => {
        onClickOutSide();
    }

    useOnClickOutside(ref, onOutSide);
    
    return (
        <div ref={ref}>
            {children}
        </div>
    )
}
export { WrapFilterTable };