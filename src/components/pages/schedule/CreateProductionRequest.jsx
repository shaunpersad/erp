import React from 'react';
import { Modal } from 'react-bootstrap';
import ReactSelect from 'react-select';
import uuid from 'uuid';

class CreateProductionRequest extends React.Component {

    state = Object.assign({
        id: uuid.v4(),
        product: this.props.products.find(product => product.id === this.props.productId) || null,
        productId: null,
        products: [],
        goal: 0,
        onCreated: data => {},
        onHide: () => {},
        show: false
    }, this.props);

    onChangeProduct = product => {

        this.setState({ product });
    };

    onChangeGoal = ({ currentTarget: { value: goal } }) => {

        this.setState({ goal });
    };

    onSubmit = e => {

        e.preventDefault();

        this.props.onCreated({
            id: this.props.id || `${this.state.product.id}/${this.state.id}`,
            productId: this.state.product ? this.state.product.id : null,
            goal: Number(this.state.goal)
        });
    };

    render() {

        return (
            <div className="create-production-request">

                    <Modal show={true} onHide={this.props.onHide} bsSize="small">
                        <Modal.Header closeButton>
                            <Modal.Title>{this.props.id ? 'Edit Production Goal' : 'Add Product for Production'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>

                            <form onSubmit={this.onSubmit}>
                                <div className="form-group">
                                    <label htmlFor="product-id">Product ID</label>
                                    <ReactSelect
                                        isDisabled={this.props.id}
                                        id="product-id"
                                        value={this.state.product}
                                        onChange={this.onChangeProduct}
                                        options={this.props.products}
                                        getOptionLabel={this.constructor.productToOptionLabel}
                                        getOptionValue={this.constructor.productToOptionValue}
                                        placeholder="Enter a product ID"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="goal">Goal</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="goal"
                                        placeholder="Enter a number"
                                        value={this.state.goal}
                                        onChange={this.onChangeGoal}
                                    />
                                </div>

                                <div className="form-group">
                                    <button type="submit" className="btn btn-success btn-block">
                                        {this.props.id ? 'Edit' : 'Add'}
                                    </button>
                                </div>

                            </form>

                        </Modal.Body>
                    </Modal>

            </div>
        );
    }

    static productToOptionLabel(product) {

        return product.id;
    }

    static productToOptionValue(product) {

        return product.id;
    }
}

export default CreateProductionRequest;