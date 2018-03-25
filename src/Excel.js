/**
 * Created by darlenelee on 23/03/2018.
 */
import React, { Component } from 'react';
import './Excel.css';
class Excel extends Component {
    constructor(props) {
        //noinspection JSAnnotator
        super(props);
        this.state =  {
            data: this.props.initialData,
            headers: this.props.headers,
            sortby: null,
            descending: false,
            edit: null, // [row index, cell index],
            search: false,
        };
        this._sort = this._sort.bind(this);
        this._showEditor = this._showEditor.bind(this);
        this._save = this._save.bind(this);
        this._toggleSearch = this._toggleSearch.bind(this);
        this._search = this._search.bind(this);
        this._download = this._download.bind(this);
        this._renderToolbar = this._renderToolbar.bind(this);
        this._renderSearch = this._renderSearch.bind(this);
        this._renderTable = this._renderTable.bind(this);
    }

    _sort(e) {
        var column = e.target.cellIndex;
        var data = this.state.data.slice();
        var descending = this.state.sortby === column && !this.state.descending;
        data.sort(function (a, b) {
            return descending
                ? (a[column] < b[column] ? 1 : -1)
                : (a[column] > b[column] ? 1 : -1);
        });
        this.setState({
            data: data,
            sortby: column,
            descending: descending,
        });
    };

    _showEditor(e) {
        this.setState({
            edit: {
                row: parseInt(e.target.dataset.row, 10),
                cell: e.target.cellIndex,
            }
        });
    }

    _save(e) {
        e.preventDefault();
        var input = e.target.firstChild;
        var data = this.state.data.slice();
        data[this.state.edit.row][this.state.edit.cell] = input.value;
        this.setState({
            edit: null,
            data: data,
        });
    };

    _toggleSearch() {
        if (this.state.search) {
            this.setState({
                data: this._preSearchData,
                search: false,
            });
            this._preSearchData = null;
        } else {
            this._preSearchData = this.state.data;
            this.setState({
                search: true,
            });
        }
    };

    _search(e) {
        var needle = e.target.value.toLowerCase();
        if (!needle) {
            this.setState({data: this._preSearchData});
            return;
        }
        var idx = e.target.dataset.idx;
        var searchdata = this._preSearchData.filter(function (row) {
            return row[idx].toString().toLowerCase().indexOf(needle) > -1;
        });
        this.setState({data: searchdata});
    };

    _download(format, ev) {
        var contents = format === 'json'
            ? JSON.stringify(this.state.data)
            : this.state.data.reduce(function (result, row) {
                return result
                    + row.reduce(function (rowresult, cell, idx) {
                        return rowresult
                            + '"'
                            + cell.replace(/"/g, '""')
                            + '"'
                            + (idx < row.length - 1 ? ',' : '');
                    }, '')
                    + "\n";
            }, '');

        var URL = window.URL || window.webkitURL;
        var blob = new Blob([contents], {type: 'text/' + format});
        ev.target.href = URL.createObjectURL(blob);
        ev.target.download = 'data.' + format;
    }

    render() {
        return (
            <div>
                {this._renderToolbar()},
                {this._renderTable()}
            </div>
        );
    }

    _renderToolbar() {
        return (
            <div className="toolbar">
                <button onClick={this._toggleSearch}>Search</button>
                <a onClick={this._download.bind(this, 'json')} href="data.json">
                    Export JSON
                </a>
                <a onClick={this._download.bind(this, 'csv')} href="data.csv"> Export CSV</a>
            </div>
        )
    }

    _renderSearch() {
        if (!this.state.search) {
            return null;
        }
        return (
            <tr onChange={this._search}>
                {this.props.headers.map(function (_ignore, idx) {
                    return <td key={idx} class="text-center">
                        <input type="text" data-idx={idx}  />
                </td>
                })}
            </tr>
        );
    }

    _renderTable() {
        return (
            <table>
                <thead onClick={this._sort} ><tr >{   // caution: use {} instead of " "
                    this.props.headers.map(function (title, idx) {
                        if (this.state.sortby === idx) {
                            title += this.state.descending ? ' \u2191' : ' \u2193';

                        }
                        return <th key={idx} class="text-center">{title}</th>;  // col name
                    }, this)
                }</tr>
                </thead>
                <tbody onDoubleClick={this._showEditor}> {this._renderSearch()} {this.state.data.map(function (row, rowidx) {
                    return (
                        <tr key={rowidx} class="text-center">{ //rowidx = row      idx = column   book info
                            row.map(function (cell, idx) {
                                var content = cell;
                                var edit = this.state.edit;
                                if (edit && edit.row === rowidx
                                    && edit.cell === idx) {
                                    content = (
                                        <form onSubmit={this._save} >
                                            <input type="text" defaultValue={cell} />
                                        </form>);
                                }
                                return <td key={idx} data-row={rowidx} >{content}</td>;
                            }, this)}
                        </tr>);
                }, this)}
                </tbody>
            </table>
        );
    };
}
Excel.displayName = 'Excel';
Excel._preSearchData = null;
export default Excel;