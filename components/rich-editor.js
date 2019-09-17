import Html from 'slate-html-serializer'

const BLOCK_TAGS = {
    blockquote: 'quote',
    p: 'paragraph',
    pre: 'code',
  }
  
  // Add a dictionary of mark tags.
  const MARK_TAGS = {
    em: 'italic',
    strong: 'bold',
    u: 'underline',
  }
  
  const rules = [
    {
      deserialize(el, next) {
        const type = BLOCK_TAGS[el.tagName.toLowerCase()]
        if (type) {
          return {
            object: 'block',
            type: type,
            data: {
              className: el.getAttribute('class'),
            },
            nodes: next(el.childNodes),
          }
        }
      },
      serialize(obj, children) {
        if (obj.object == 'block') {
          switch (obj.type) {
            case 'code':
              return (
                <pre>
                  <code>{children}</code>
                </pre>
              )
            case 'paragraph':
              return <p className={obj.data.get('className')}>{children}</p>
            case 'quote':
              return <blockquote>{children}</blockquote>
          }
        }
      },
    },
    // Add a new rule that handles marks...
    {
      deserialize(el, next) {
        const type = MARK_TAGS[el.tagName.toLowerCase()]
        if (type) {
          return {
            object: 'mark',
            type: type,
            nodes: next(el.childNodes),
          }
        }
      },
      serialize(obj, children) {
        if (obj.object == 'mark') {
          switch (obj.type) {
            case 'bold':
              return <strong>{children}</strong>
            case 'italic':
              return <em>{children}</em>
            case 'underline':
              return <u>{children}</u>
          }
        }
      },
    },
  ]

// Create a new serializer instance with our `rules` from above.
const html = new Html({ rules })

// Load the initial value from Local Storage or a default.
const initialValue = '<p></p>'

class RichEditor extends React.Component {
  state = {
    value: html.deserialize(initialValue),
  }

  onChange = ({ value }) => {
    this.setState({ value })
  }

  render() {
    return (
      <Editor
        value={this.state.value}
        onChange={this.onChange}
        // Add the ability to render our nodes and marks...
        renderBlock={this.renderNode}
        renderMark={this.renderMark}
      />
    )
  }

  renderNode = (props, editor, next) => {
    switch (props.node.type) {
      case 'code':
        return (
          <pre {...props.attributes}>
            <code>{props.children}</code>
          </pre>
        )
      case 'paragraph':
        return (
          <p {...props.attributes} className={props.node.data.get('className')}>
            {props.children}
          </p>
        )
      case 'quote':
        return <blockquote {...props.attributes}>{props.children}</blockquote>
      default:
        return next()
    }
  }

  // Add a `renderMark` method to render marks.
  renderMark = (props, editor, next) => {
    const { mark, attributes } = props
    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{props.children}</strong>
      case 'italic':
        return <em {...attributes}>{props.children}</em>
      case 'underline':
        return <u {...attributes}>{props.children}</u>
      default:
        return next()
    }
  }
}

export default RichEditor