import React from "react";

const BreadcrumbsContext = React.createContext();

export function withBreadcrumbsContext(Component) {

    return function ComponentWithBreadcrumbsContext(props) {

        return (
            <BreadcrumbsContext.Consumer>
                {breadcrumbs => <Component {...props} breadcrumbs={breadcrumbs} />}
            </BreadcrumbsContext.Consumer>
        );
    };
}

export default BreadcrumbsContext;