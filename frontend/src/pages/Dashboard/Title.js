import React from "react";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";

const Title = ({ children }) => {
	return (
		<Typography component="h2" variant="h6" color="primary" gutterBottom>
			{children}
		</Typography>
	);
};

Title.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Title;
