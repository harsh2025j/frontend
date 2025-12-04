import {  Calendar } from "lucide-react";
import {contentData} from "../../../lib/dummy"

const ContentTable = () => {
// const contentData = [
//   {
//     title: "Bombay HC on Insolvency",
//     writer: "Ujjwal Singh",
//     category: "Supreme Court",
//     status: "Draft",
//     language: "English",
//     date: "Oct 22",
//   },
//   {
//     title: "Global Markets Weekly",
//     writer: "Satyam Singh",
//     category: "Business",
//     status: "Pending",
//     language: "Hindi",
//     date: "Oct 22",
//   },
//   {
//     title: "Sport Law Doping Case",
//     writer: "Ravi Sharma",
//     category: "Criminal Law",
//     status: "Published",
//     language: "English",
//     date: "Oct 22",
//   },
//   {
//     title: "Consumer Law Update",
//     writer: "Ankit Rana",
//     category: "Consumer Law",
//     status: "Pending",
//     language: "Hindi",
//     date: "Oct 22",
//   },
// ];


  return (
    <div className="bg-white rounded-2xl  border border-gray-100 p-6 mt-6">
      <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
        {/* <FileText size={18} className="text-primary" />  */}
        Content Pipeline & Status

      </h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b text-left">
            <th className="py-2">Title</th>
            <th className="py-2">Writer/Author</th>
            <th className="py-2">Category</th>
            <th className="py-2">Status</th>
            <th className="py-2">Language</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {contentData.map((item) => (
            <tr key={item.title} className="border-b last:border-none hover:bg-gray-50 transition">
              <td className="py-2">{item.title}</td>
              <td className="py-2">{item.writer}</td>
              <td className="py-2">{item.category}</td>
              <td className="py-2">{item.status}</td>
              <td className="py-2">{item.language}</td>
         
              <td className="py-2 flex items-center gap-2 text-gray-600">
                <Calendar size={14} /> {item.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContentTable;
