import { memo, useEffect, useState } from "react"
import { Menu as AntMenu } from "antd";
import type { MenuProps } from "antd"
import { menuItems } from "../routes"
import { useLocation, useNavigate } from "react-router-dom";

const Menu = () => {

	const location = useLocation();

	const resolveLocationToOpenKey = () => {
		const spitLocation = location.pathname.split('/')
		const parentPath = `/${spitLocation[1]}`;
		if(spitLocation.length > 3) {
			const childPath = `/${spitLocation[2]}`;
			return [`${parentPath}`, `${parentPath}${childPath}`]
		}
		return [parentPath]
	}

	const [selectedKey, setSelectedKey] = useState<string>(location.pathname);
	const [openKey, setOpenKey] = useState<string[]>(resolveLocationToOpenKey());

	const navigate = useNavigate()

	useEffect(() => {
		setSelectedKey(location.pathname)
		setOpenKey(resolveLocationToOpenKey())
	}, [location])

	const onSelectChange: MenuProps['onClick'] = (e) => {
		navigate(e.key)
	};

	return <AntMenu
		mode="inline"
		theme="light"
		items={menuItems as MenuProps['items']}
		defaultSelectedKeys={[selectedKey]}
		selectedKeys={[selectedKey]}
		defaultOpenKeys={openKey}
		openKeys={openKey}
		onOpenChange={(e) => {
			const lastOpen = e[e.length - 1]
			// const pageOpen = e;
			if(lastOpen) {
				setOpenKey((previos) => lastOpen.includes(previos[0]) ? e : [lastOpen])
			} else {
				setOpenKey(e)
			}
		}}
		onClick={onSelectChange}
	/>
}

export const MenuLayout = memo(Menu);