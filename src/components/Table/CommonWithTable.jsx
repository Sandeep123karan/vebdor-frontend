import { Table } from "antd";
const CommonTable = ({
  columns,
  data,
  loading,
  rowClassName,
}) => {
  return (
    <Table
      bordered
      rowClassName={rowClassName}
      className="paginationInput"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={true}  
      sticky
      scroll={{ x: "max-content" }}
    />
  );
};

export default CommonTable;
