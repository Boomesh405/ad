package com.estatehub.repository;

import com.estatehub.entity.DocumentShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentShareRepository extends JpaRepository<DocumentShare, UUID> {
    List<DocumentShare> findByDocIdAndSharedWithEmail(UUID docId, String email);
}
