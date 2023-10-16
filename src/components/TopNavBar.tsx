import { Menu, Dropdown, Avatar } from 'antd';
import { ExportOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useUserStore } from '../stores/useUserStore';
import { useNavigate } from 'react-router-dom';

const TopNavBar = () => {

	const navigate = useNavigate()
	const items: MenuProps['items'] = [
		{
			key: '1',
			label: (
				<span>
					<UserOutlined />
					{'Tài khoản của tôi'}
				</span>
			),
		},
		{
			key: '2',
			label: (
				<span
					onClick={() => {
						localStorage.removeItem('key')
						localStorage.removeItem('userInfor')
						navigate('/')
					}
					}
				>
					<ExportOutlined />
					{'Đăng xuất'}
				</span>
			),
		}
	];

	const { user } = useUserStore()

	return (
		<>
			<div className="menu_container">
				<Menu
					mode="horizontal"
					//   click="handleClick"
					style={{
						height: '100%',
						lineHeight: '52px',
						color: '#00885a',
						borderBottom: '1px solid #f1f1f1',
						display: 'flex',
						alignItems: 'center'
					}}
				>
					<Dropdown menu={{ items }} placement="bottom" arrow={{ pointAtCenter: true }}>
						<div className="ant-dropdown-link">
							<Avatar>
								{user?.username ? user?.username.charAt(0).toUpperCase() : ""}
							</Avatar>
							<span style={{ marginLeft: 4 }}>
								{user?.username}
							</span>
						</div>
					</Dropdown>
				</Menu>
			</div>
		</>
	)
}

export default TopNavBar;