package org.visallo.web.product.graph.model;

import org.visallo.core.model.workspace.product.UpdateProductEdgeOptions;
import org.visallo.web.clientapi.model.GraphPosition;

import java.util.List;

public class GraphUpdateProductEdgeOptions extends UpdateProductEdgeOptions {
    private String id;
    private List<String> children;
    private String parent;
    private GraphPosition pos;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<String> getChildren() {
        return children;
    }

    public String getParent() {
        return parent;
    }

    public void setParent(String parent) {
        this.parent = parent;
    }

    public void setPos(GraphPosition pos) {
        this.pos = pos;
    }

    public GraphPosition getPos() {
        return pos;
    }
}
