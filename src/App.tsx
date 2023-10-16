import { Navigate, Route, Routes } from "react-router-dom";
import UrlPath from "./constants/UrlPath.ts";
import LoginPage from "./pages/login";
import 'antd/dist/reset.css';
import './assets/sass/global.scss';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from "./components/MainLayout.tsx";
import './apis/axios'
import { routeItems } from "./routes/index.tsx";
import { Button, Result } from "antd";
import './index.scss'

function App() {

	return (
		<>
			<Routes>
				<Route element={<MainLayout />}>
					{routeItems}
					<Route path={'/'} element={<Navigate to={'/business/plan'} />} />
				</Route>
				<Route path={'*'}
					element={
						<Result
							status="404"
							title="404"
							subTitle="Sorry, the page you visited does not exist."
							extra={<Button type="primary">{'Trở về trang chủ'}</Button>
							} />
					}
				/>
				<Route path={UrlPath.LOGIN} element={<LoginPage />} />
			</Routes>
			{/* <ToastContainer /> */}
		</>
	)
}

export default App
