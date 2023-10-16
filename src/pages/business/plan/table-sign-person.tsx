import TableData from '@components/TableData';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TableSignPerson = ({ columnsVoffice, vofficeData, defaulVofficeDataList }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );
  const onDragEnd = ({ active, over }) => {
    vofficeData.move(active?.data?.current?.sortable?.index, over?.data?.current?.sortable?.index);
    defaulVofficeDataList.move(active?.data?.current?.sortable?.index, over?.data?.current?.sortable?.index);
  };

  const Row = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: props['data-row-key'],
    });
    const style = {
      ...props.style,
      transform: CSS.Transform.toString(
        transform && {
          ...transform,
          scaleY: 1,
        }
      ),
      transition,
      cursor: 'move',
      ...(isDragging
        ? {
            position: 'relative',
            zIndex: 9999,
          }
        : {}),
    };
    return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
  };

  return (
    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        items={vofficeData?.fields?.map((i: { _id: string }) => i?._id)}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ zIndex: 1, width: '100%' }}>
          <TableData
            tableProps={{
              components: {
                body: {
                  row: Row,
                },
              },
              rowKey: '_id',
              scroll: {
                x: 1720,
              },
              columns: columnsVoffice,
              dataSource: vofficeData.fields,
              style: {
                width: '100%',
              },
            }}
          />
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TableSignPerson;
