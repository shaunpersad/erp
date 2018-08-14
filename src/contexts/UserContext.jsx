import React from "react";

const UserContext = React.createContext();

export function withUserContext(Component) {

    return function ComponentWithUserContext(props) {

        return (
            <UserContext.Consumer>
                {user => <Component {...props} user={user} />}
            </UserContext.Consumer>
        );
    };
}

export default UserContext;