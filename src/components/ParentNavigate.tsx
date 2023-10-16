import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ParentNavigateProps {
	indexChildPath: string,
	parentPath: string
}

const ParentNavigate = ({ indexChildPath, parentPath }: ParentNavigateProps) => {
	const { pathname } = useLocation()
	if (pathname === parentPath) {
		return <Navigate to={indexChildPath} />
	}
	return <Outlet/>
}

export default ParentNavigate;