import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { SearchBox } from "@features/search-psychologists";
import { FiltersPanel } from "@widgets/filters-panel";
import { PsychologistCard } from "@widgets/psychologist-card";
import { Button } from "@shared/ui/Button/Button";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { listPsychologists, type Psychologist, type PsychologistQuery } from "@entities/psychologist";
import { listSpecialties } from "@entities/specialty";
import { routerInstance } from "@shared/lib/router/routerInstance";
import directoryPageTemplate from "@pages/directory/DirectoryPage.hbs?raw";
import "@pages/directory/DirectoryPage.css";

const PAGE_SIZE = 9;

export class DirectoryPage extends Block<BlockOwnProps> {
  protected template = directoryPageTemplate;
  private query: PsychologistQuery = {};
  private results: Psychologist[] = [];
  private skip = 0;
  private abortController: AbortController | undefined;

  protected componentDidMount() {
    this.mountInto("search", new SearchBox({
      onSearch: (q) => this.applyQuery({ ...this.query, q }),
    }));

    void this.loadFilters();
    void this.loadResults();
  }

  protected componentWillUnmount() {
    this.abortController?.abort();
  }

  private async loadFilters() {
    const result = await listSpecialties();
    const specialties = result.isOk() ? result.value : [];

    this.mountInto("filters", new FiltersPanel({
      specialtyOptions: [
        { value: "", label: "Todas las especialidades" },
        ...specialties.map((specialty) => ({ value: specialty.name, label: specialty.name })),
      ],
      maxRate: 1000,
      onChange: (filters) => this.applyQuery({ ...this.query, ...filters }),
    }));
  }

  private async applyQuery(query: PsychologistQuery) {
    this.query = query;
    this.skip = 0;
    await this.loadResults();
  }

  private async loadMore() {
    this.skip += PAGE_SIZE;
    await this.loadResults();
  }

  private async loadResults() {
    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;

    if (this.skip === 0)
      this.replaceChildrenInto("results", [new Spinner({})]);

    const result = await listPsychologists({ ...this.query, skip: this.skip, limit: PAGE_SIZE }, controller.signal);

    if (controller.signal.aborted)
      return;

    if (result.isErr()) {
      if (this.skip === 0)
        this.replaceChildrenInto("results", [
          new EmptyState({ title: "Ocurrió un error", description: "Intentá de nuevo en un momento." }),
        ]);
      return;
    }

    this.results = this.skip === 0 ? result.value : [...this.results, ...result.value];
    this.renderPsychologists(result.value.length === PAGE_SIZE);
  }

  private renderPsychologists(hasMore: boolean) {
    if (this.results.length === 0) {
      this.replaceChildrenInto("results", [
        new EmptyState({ title: "No se encontraron especialistas", description: "Probá con otra palabra o ajustá los filtros." }),
      ]);
      this.replaceChildrenInto("loadMore", []);
      return;
    }

    this.replaceChildrenInto(
      "results",
      this.results.map((psychologist) =>
        new PsychologistCard({ psychologist, onOpen: (id) => routerInstance.navigate(`/profile/${id}`) }),
      ),
    );

    this.replaceChildrenInto(
      "loadMore",
      hasMore ? [new Button({ label: "Cargar más", variant: "secondary", onClick: () => void this.loadMore() })] : [],
    );
  }
}
