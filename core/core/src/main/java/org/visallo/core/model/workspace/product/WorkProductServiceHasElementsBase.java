package org.visallo.core.model.workspace.product;

import com.google.common.collect.Lists;
import org.vertexium.*;
import org.visallo.core.model.graph.ElementUpdateContext;
import org.visallo.core.model.user.AuthorizationRepository;
import org.visallo.core.model.workspace.WorkspaceProperties;
import org.visallo.core.security.VisalloVisibility;
import org.visallo.core.user.User;
import org.visallo.core.util.StreamUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public abstract class WorkProductServiceHasElementsBase<TVertex extends WorkProductVertex, TEdge extends WorkProductEdge>
        implements WorkProductService, WorkProductServiceHasElements {
    private final AuthorizationRepository authorizationRepository;

    protected WorkProductServiceHasElementsBase(
            AuthorizationRepository authorizationRepository
    ) {
        this.authorizationRepository = authorizationRepository;
    }

    @Override
    public WorkProductExtendedData getExtendedData(
            Graph graph,
            Vertex workspaceVertex,
            Vertex productVertex,
            GetExtendedDataParams params,
            User user,
            Authorizations authorizations
    ) {
        WorkProductExtendedData extendedData = new WorkProductExtendedData();
        String id = productVertex.getId();

        if (params.isIncludeVertices()) {
            Map<String, TVertex> vertices = new HashMap<>();
            List<Edge> productVertexEdges = Lists.newArrayList(productVertex.getEdges(
                    Direction.OUT,
                    WorkspaceProperties.PRODUCT_TO_ENTITY_RELATIONSHIP_IRI,
                    authorizations
            ));

            List<String> ids = productVertexEdges.stream()
                    .map(edge -> edge.getOtherVertexId(id))
                    .collect(Collectors.toList());
            Map<String, Vertex> othersById = StreamUtil.stream(graph.getVertices(ids, FetchHint.NONE, authorizations))
                    .collect(Collectors.toMap(Vertex::getId, Function.identity()));

            for (Edge propertyVertexEdge : productVertexEdges) {
                String otherId = propertyVertexEdge.getOtherVertexId(id);
                TVertex vertex = createWorkProductVertex();
                vertex.setId(otherId);
                if (!othersById.containsKey(otherId)) {
                    vertex.setUnauthorized(true);
                }
                populateVertexWithWorkspaceEdge(propertyVertexEdge, vertex);
                vertices.put(otherId, vertex);
            }
            extendedData.setVertices(vertices);
        }

        if (params.isIncludeEdges()) {
            Map<String, TEdge> edges = new HashMap<>();
            Authorizations systemAuthorizations = authorizationRepository.getGraphAuthorizations(
                    user,
                    VisalloVisibility.SUPER_USER_VISIBILITY_STRING
            );
            Iterable<Vertex> productVertices = Lists.newArrayList(productVertex.getVertices(
                    Direction.OUT,
                    WorkspaceProperties.PRODUCT_TO_ENTITY_RELATIONSHIP_IRI,
                    systemAuthorizations
            ));
            Iterable<RelatedEdge> productRelatedEdges = graph.findRelatedEdgeSummaryForVertices(productVertices, authorizations);
            List<String> ids = StreamUtil.stream(productRelatedEdges)
                    .map(RelatedEdge::getEdgeId)
                    .collect(Collectors.toList());
            Map<String, Boolean> relatedEdgesById = graph.doEdgesExist(ids, authorizations);

            for (RelatedEdge relatedEdge : productRelatedEdges) {
                String edgeId = relatedEdge.getEdgeId();
                TEdge edge = createWorkProductEdge();
                edge.setEdgeId(relatedEdge.getEdgeId());

                if (relatedEdgesById.get(edgeId)) {
                    edge.setLabel(relatedEdge.getLabel());
                    edge.setOutVertexId(relatedEdge.getOutVertexId());
                    edge.setInVertexId(relatedEdge.getInVertexId());
                } else {
                    edge.setUnauthorized(true);
                }
                edges.put(edgeId, edge);
            }
            extendedData.setEdges(edges);
        }

        return extendedData;
    }

    protected abstract TEdge createWorkProductEdge();

    protected abstract TVertex createWorkProductVertex();

    @Override
    public void cleanUpElements(Graph graph, Vertex productVertex, Authorizations authorizations) {
        Iterable<Edge> productElementEdges = productVertex.getEdges(
                Direction.OUT,
                WorkspaceProperties.PRODUCT_TO_ENTITY_RELATIONSHIP_IRI,
                authorizations
        );

        for (Edge productToElement : productElementEdges) {
            graph.softDeleteEdge(productToElement, authorizations);
        }

        graph.flush();
    }

    protected abstract void populateVertexWithWorkspaceEdge(Edge propertyVertexEdge, TVertex vertex);

    protected abstract void updateProductEdge(
            ElementUpdateContext<Edge> elemCtx,
            UpdateProductEdgeOptions update,
            Visibility visibility
    );

    public static String getEdgeId(String productId, String vertexId) {
        return productId + "_hasVertex_" + vertexId;
    }
}
