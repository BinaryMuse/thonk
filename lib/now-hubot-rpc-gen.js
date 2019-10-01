class RpcMethod {
  constructor(name, options, handler) {
    this._name = name
    this._options = options
    this._handler = handler
  }

  handleRequest(req, res) {
    const {method, params, room_id, user} = req.body
    this._handler({params: params || {}, method, room_id, user}, (result, others) => {
      others = others || {}
      const resp = Object.assign({result: result}, others)
      res.json(resp)
    })
  }

  toJSON() {
    return {
      help: this._options.help || '',
      regex: this._options.regex,
      params: this._options.params,
      path: this._name
    }
  }
}

class RpcEndpoint {
  constructor (namespace) {
    this._namespace = namespace
    this._methods = {}

    this.respond = this.respond.bind(this)
  }

  method(name, options, handler) {
    if (this._methods[name]) {
      throw new Error(`Method ${name} already registered`)
    }

    this._methods[name] = new RpcMethod(name, options, handler)
  }

  respond(req, res) {
    const type = req.query.type
    if (type === 'manifest') {
      this.manifest(req, res)
    } else if (type === 'method') {
      const name = req.query.method
      this.handleMethod(name, req, res)
    } else {
      res.status(500)
      res.end('Invalid Hubot RPC invocation')
    }
  }

  handleMethod(name, req, res) {
    const method = this._methods[name]
    if (!method) {
      res.status(404).end()
    } else {
      method.handleRequest(req, res)
    }
  }

  manifest(req, res) {
    res.json({
      namespace: this._namespace,
      help: this._help || null,
      version: 2,
      error_response: this._errorResponse || '',
      methods: this.methods()
    })
  }

  methods() {
    return Object.keys(this._methods).reduce((acc, name) => {
      acc[name] = this._methods[name].toJSON()
      return acc
    }, {})
  }
}

module.exports = {
  Endpoint: RpcEndpoint
}
