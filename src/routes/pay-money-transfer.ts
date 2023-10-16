import { DashboardOutlined } from '@ant-design/icons';
import loadable from '@loadable/component';
import { RouteItemType } from './type';
const TransferList = loadable(() => import('@pages/pay-money-transfer/transfer-list'))
const ProposalTable = loadable(() => import('@pages/pay-money-transfer/proposal-table'))

export const payMoneyTransfer: RouteItemType = {
	path: '/pay-money-transfer',
	label: 'Chi tiền chuyển khoản',
	icon: DashboardOutlined,
	element: null,
	children: [
		{
			path: '/pay-money-transfer/transfer-list',
			label: 'Danh sách yêu cầu',
			element: TransferList
		},
		{
			path: '/pay-money-transfer/proposal-table',
			label: 'Bảng đề nghị',
			element: ProposalTable
		},
	]
}